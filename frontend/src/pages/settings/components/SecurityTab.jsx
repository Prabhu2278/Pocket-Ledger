                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="pocket-ledger-btn-primary"
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default SecurityTab
